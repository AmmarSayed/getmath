"""Build the site, then check the table of contents, the table of data, every displayed Python program and output,
and every Colab notebook.

With --no-build, check the pages that are already in dist."""

import json
import subprocess
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

import nbformat
from jupyter_client import KernelManager
from jupyter_client.kernelspec import KernelSpecManager
from nbclient import NotebookClient

sys.path.insert(0, str(Path(__file__).resolve().parent))
import make_notebook

ROOT = Path(__file__).resolve().parent.parent
SNIPPETS = ROOT / "src" / "snippets"
DIST = ROOT / "dist"
NOTEBOOKS = make_notebook.NOTEBOOKS
errors = []


def read(path):
    """The text of a file. One that is not UTF-8 is a problem, and reads as None."""
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        problem = f"{path.relative_to(ROOT).as_posix()}: not UTF-8"
        if problem not in errors:
            errors.append(problem)


def start_of(text):
    return repr(str(text)[:60])


def compare(problem, source, actual):
    expected = read(source)
    if expected is not None and actual != expected:
        errors.append(f"{problem} {source.name}\n  expected: {expected!r}\n  actual:   {actual!r}")


def build():
    command = ["node", str(ROOT / "node_modules" / "astro" / "bin" / "astro.mjs"), "build"]
    done = subprocess.run(command, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, encoding="utf-8")
    if done.returncode:
        errors.append(f"the site does not build, so its pages were not checked\n{done.stdout.rstrip()}")
    return not done.returncode


def check_toc():
    done = subprocess.run([sys.executable, "-I", "-X", "utf8", str(ROOT / "scripts" / "check_toc.py")], capture_output=True, encoding="utf-8")
    lines = (done.stdout + done.stderr).strip().splitlines()
    if done.returncode == 0 and lines and not done.stderr:
        return lines[-1].removeprefix("OK: ")
    errors.extend(f"table of contents: {line}" for line in lines)
    if not lines:
        errors.append(f"table of contents: check_toc.py printed nothing, with exit code {done.returncode}")


def check_datasets():
    """Reproduces the table of data. Its known differences are shown on every run."""
    command = [sys.executable, "-I", "-X", "utf8", str(ROOT / "scripts" / "check_datasets.py")]
    try:
        done = subprocess.run(command, capture_output=True, encoding="utf-8", timeout=600)
    except subprocess.TimeoutExpired:
        errors.append("datasets: check_datasets.py did not finish in 600 seconds")
        return
    lines = (done.stdout + done.stderr).strip().splitlines()
    if done.returncode == 0 and lines and not done.stderr:
        print("\n".join(lines[:-1]))
        return lines[-1].removeprefix("OK: ")
    errors.extend(f"datasets: {line}" for line in lines)
    if not lines:
        errors.append(f"datasets: check_datasets.py printed nothing, with exit code {done.returncode}")


def run_programs():
    """Runs each program, and returns the names of those that have both files."""
    programs = {path.stem for path in SNIPPETS.glob("*.py")}
    outputs = {path.stem for path in SNIPPETS.glob("*.txt")}
    if not programs and not outputs:
        errors.append("src/snippets: no programs")
    errors.extend(f"{name}: has {name}.py but no {name}.txt" for name in sorted(programs - outputs))
    errors.extend(f"{name}: has {name}.txt but no {name}.py" for name in sorted(outputs - programs))
    for name in sorted(programs & outputs):
        with tempfile.TemporaryDirectory() as folder:
            command = [sys.executable, "-I", "-X", "utf8", str(SNIPPETS / f"{name}.py")]
            try:
                done = subprocess.run(command, cwd=folder, stdin=subprocess.DEVNULL, capture_output=True, encoding="utf-8", errors="backslashreplace", timeout=60)
            except subprocess.TimeoutExpired:
                errors.append(f"{name}: the program did not finish in 60 seconds")
                continue
        if done.returncode:
            errors.append(f"{name}: the program failed with exit code {done.returncode}\n{done.stderr.rstrip()}")
        elif done.stderr:
            errors.append(f"{name}: the program wrote to stderr\n{done.stderr.rstrip()}")
        else:
            compare(f"{name}: the output differs from", SNIPPETS / f"{name}.txt", done.stdout)
    return programs & outputs


def execute(name, text):
    """Runs a notebook in the locked environment, and compares what it prints with the output file."""
    try:
        notebook = nbformat.reads(text, as_version=4)
    except Exception as problem:
        errors.append(f"{name}: the notebook cannot be read\n{type(problem).__name__}: {problem}")
        return
    with tempfile.TemporaryDirectory() as folder:
        # Our own kernel, found only here, and run like the programs: by this Python, isolated, in UTF-8.
        # No setting of the machine or of the user reaches it.
        kernels = Path(folder) / "kernels" / "python3"
        kernels.mkdir(parents=True)
        spec = {
            "argv": [sys.executable, "-I", "-X", "utf8", "-m", "ipykernel_launcher", "-f", "{connection_file}"],
            "display_name": "Python 3",
            "language": "python",
            "env": {"IPYTHONDIR": folder, "JUPYTER_NO_CONFIG": "1", "JUPYTER_CONFIG_DIR": folder, "JUPYTER_CONFIG_PATH": folder},
        }
        (kernels / "kernel.json").write_text(json.dumps(spec), encoding="utf-8")
        specs = KernelSpecManager(kernel_dirs=[str(kernels.parent)], ensure_native_kernel=False)
        manager = KernelManager(kernel_name="python3", kernel_spec_manager=specs, connection_file=str(Path(folder) / "kernel.json"))
        client = NotebookClient(notebook, km=manager, timeout=60, resources={"metadata": {"path": folder}})
        try:
            # The kernel's own warnings are not the notebook's output. It must stop before its folder is deleted.
            client.execute(stderr=subprocess.DEVNULL, cleanup_kc=True)
        except Exception as problem:
            errors.append(f"{name}: the notebook did not run\n{type(problem).__name__}: {problem}")
            return
    streams = [output for cell in notebook.cells for output in cell.get("outputs", [])]
    if any(output.output_type != "stream" or output.name != "stdout" for output in streams):
        errors.append(f"{name}: the notebook printed more than its output, or an error\n{streams!r}")
    else:
        compare(f"{name}: the output of the notebook differs from", SNIPPETS / f"{name}.txt", "".join(output.text for output in streams))


def check_notebooks(known):
    """Each notebook is made again from its program and output, and must be the file that is committed."""
    files = {path.stem for path in NOTEBOOKS.glob("*.ipynb")}
    errors.extend(f"notebooks/{name}.ipynb: no program and output in src/snippets for it" for name in sorted(files - known))
    for name in sorted(known):
        try:
            made = make_notebook.notebook(name)
        except Exception as problem:
            errors.append(f"{name}: no notebook can be made\n{type(problem).__name__}: {problem}")
            continue
        if name not in files:
            errors.append(f"{name}: has no notebooks/{name}.ipynb. Run: uv run --locked scripts/make_notebook.py")
        else:
            stored = read(NOTEBOOKS / f"{name}.ipynb")
            if stored != made:
                errors.append(f"notebooks/{name}.ipynb differs from its program and output. Run: uv run --locked scripts/make_notebook.py")
            # The file that Colab opens is the one that runs.
            if stored is not None:
                execute(name, stored)
    return len(known)


class Page(HTMLParser):
    """Finds every displayed program and output, and what each is made of."""

    def __init__(self, page, known):
        super().__init__()
        self.page, self.known = page, known
        self.shown = 0
        self.block = None  # the open <pre> or <samp>: its kind, name and text so far

    def problem(self, what, text):
        errors.append(f"{self.page}: a displayed program or output with no source ({what}), starting {start_of(text)}")

    def source(self, kind, name):
        return SNIPPETS / f"{name}.{'py' if kind == 'program' else 'txt'}" if name in self.known else None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        href = attrs.get("href") or ""
        if tag == "a" and urlparse(href).hostname == "colab.research.google.com":
            name = href.removeprefix(make_notebook.COLAB).removesuffix(".ipynb")
            if not (href.startswith(make_notebook.COLAB) and href.endswith(".ipynb")) or name not in self.known or not (NOTEBOOKS / f"{name}.ipynb").exists():
                errors.append(f"{self.page}: a link to Colab that is not exactly {make_notebook.COLAB}NAME.ipynb for a notebook that exists: {href}")
        if tag == "astro-island" and "props" in attrs:
            props = json.loads(attrs["props"])
            if "output" in props:
                name, output = props.get("name", [0, ""])[1], props["output"][1]
                if name not in self.known:
                    self.problem(f"island output for unknown example {name!r}", output)
                else:
                    compare(f"{self.page}: the data of the island for {name} differs from", SNIPPETS / f"{name}.txt", output)
        elif tag in ("pre", "samp") and self.block:
            # Only the <samp> of an output is inside another one.
            if (tag, self.block["kind"]) != ("samp", "output"):
                self.problem(f"<{tag}> inside another block", self.block["text"])
        elif tag in ("pre", "samp"):
            # A <samp> alone is a displayed output too, and has no source.
            kinds = ("program", "output") if tag == "pre" else ()
            kind = next((kind for kind in kinds if f"data-{kind}" in attrs), None)
            self.block = {"end": tag, "kind": kind, "name": attrs.get(f"data-{kind}"), "text": ""}

    def handle_endtag(self, tag):
        if self.block and tag == self.block["end"]:
            self.finish()

    def handle_data(self, text):
        if self.block:
            self.block["text"] += text

    def finish(self):
        block, self.block = self.block, None
        self.shown += 1
        path = self.source(block["kind"], block["name"]) if block["kind"] else None
        if not path:
            return self.problem("no data-program or data-output naming a snippet", block["text"])
        compare(f"{self.page}: the displayed {block['kind']} {block['name']} differs from", path, block["text"])

    def close(self):
        super().close()
        if self.block:
            self.problem("never closed", self.block["text"])


def check_pages(known):
    pages = sorted(DIST.glob("**/*.html"))
    if not pages:
        errors.append("dist: no pages")
    shown = 0
    for page in pages:
        parser = Page(str(page.relative_to(DIST)).replace("\\", "/"), known)
        parser.feed(read(page) or "")
        parser.close()
        shown += parser.shown
    return len(pages), shown


# In case a Windows terminal cannot show what a problem quotes.
sys.stdout.reconfigure(encoding="utf-8")
toc = check_toc()
datasets = check_datasets()
known = run_programs()
notebooks = check_notebooks(known)
pages, shown = check_pages(known) if "--no-build" in sys.argv or build() else (0, 0)
print("\n".join(errors) or f"OK: {toc}; datasets: {datasets}; {len(known)} programs, {notebooks} notebooks, {pages} pages, {shown} displayed programs and outputs")
sys.exit(bool(errors))
