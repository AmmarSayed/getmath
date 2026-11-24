import type { AstroIntegration } from "astro";

/** PROTOTYPE, throwaway (issue #14). Adds the page of the three looks to the dev server, and never to a build. */
export function looksRoute(): AstroIntegration {
  return {
    name: "looks-route",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command === "dev" && process.env.LOOKS) {
          injectRoute({ pattern: "/looks", entrypoint: "./src/prototype/Looks.astro" });
        }
      },
      "astro:server:start": ({ address, logger }) => {
        if (process.env.LOOKS) {
          logger.info(`Three looks: http://${address.address}:${address.port}/getmath/looks/?look=quiet|workbench|notebook`);
        }
      },
    },
  };
}
