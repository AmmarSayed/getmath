"""Make the Colab notebook of each example in src/snippets/ from its program and its output.

Run `uv run --locked scripts/make_notebook.py` to write notebooks/*.ipynb. `scripts/verify.py` imports this
module, rebuilds each notebook in memory, and fails if the file in notebooks/ differs."""

import re
from pathlib import Path

import nbformat

ROOT = Path(__file__).resolve().parent.parent
SNIPPETS = ROOT / "src" / "snippets"
NOTEBOOKS = ROOT / "notebooks"
STATUSES = ROOT / "src" / "statuses.ts"
COLAB = "https://colab.research.google.com/github/AmmarSayed/getmath/blob/main/notebooks/"


def label():
    """The label of a technical test, from the one place the site has it."""
    found = re.search(r'"technical-test":\s*"([^"]+)"', STATUSES.read_text(encoding="utf-8"))
    if not found:
        raise ValueError("src/statuses.ts has no label for technical-test")
    return found.group(1)


def notebook(name):
    program = (SNIPPETS / f"{name}.py").read_text(encoding="utf-8")
    output = (SNIPPETS / f"{name}.txt").read_text(encoding="utf-8")
    intro = f"""# {label()}

This notebook is part of the GetMath website's technical test. It is not a lesson, and it is not approved instruction.

Run the cell below to run the same Python program as the page. It should print what the page shows as its expected output.

- **Licence:** the code is under the [MIT licence](https://github.com/AmmarSayed/getmath/blob/main/LICENSE-CODE) and the text under [CC BY 4.0](https://github.com/AmmarSayed/getmath/blob/main/LICENSE-TEXT). See the [README](https://github.com/AmmarSayed/getmath/blob/main/README.md).
- **Environment:** the program was tested with the Python and packages that the GetMath repository locks. Colab's own Python is not the same one.
"""
    nb = nbformat.v4.new_notebook(nbformat_minor=5)
    nb.metadata = {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python"},
    }
    markdown = nbformat.v4.new_markdown_cell(intro, id="label")
    code = nbformat.v4.new_code_cell(program, id="program", execution_count=1)
    code.outputs = [nbformat.v4.new_output("stream", name="stdout", text=output)]
    nb.cells = [markdown, code]
    nbformat.validate(nb)
    return nbformat.writes(nb) + "\n"


def names():
    return sorted(path.stem for path in SNIPPETS.glob("*.py") if (SNIPPETS / f"{path.stem}.txt").exists())


if __name__ == "__main__":
    NOTEBOOKS.mkdir(exist_ok=True)
    for name in names():
        (NOTEBOOKS / f"{name}.ipynb").write_text(notebook(name), encoding="utf-8", newline="\n")
        print(f"wrote notebooks/{name}.ipynb")
