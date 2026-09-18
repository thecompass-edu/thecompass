import "server-only";

import sanitizeHtml from "sanitize-html";

export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h1",
      "h2",
      "h3",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "hr",
    ],

    allowedAttributes: {
      a: [
        "href",
        "title",
        "target",
        "rel",
      ],

      img: [
        "src",
        "alt",
        "title",
        "width",
        "height",
      ],
    },

    allowedSchemes: [
      "http",
      "https",
      "mailto",
    ],

    allowedSchemesByTag: {
      img: [
        "http",
        "https",
      ],

      a: [
        "http",
        "https",
        "mailto",
      ],
    },

    allowProtocolRelative: false,

    transformTags: {
      a: sanitizeHtml.simpleTransform(
        "a",
        {
          rel: "noopener noreferrer",
        },
        true,
      ),
    },
  });
}