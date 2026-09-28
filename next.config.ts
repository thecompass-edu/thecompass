import type { NextConfig } from "next";

const isDev =
  process.env.NODE_ENV ===
  "development";

function getSupabaseInfo() {
  const url =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return {
      origin: "",
      websocketOrigin: "",
      hostname: "",
    };
  }

  try {
    const parsed = new URL(url);

    return {
      origin: parsed.origin,
      websocketOrigin:
        parsed.origin.replace(
          /^https:/,
          "wss:",
        ),
      hostname: parsed.hostname,
    };
  } catch {
    return {
      origin: "",
      websocketOrigin: "",
      hostname: "",
    };
  }
}

const {
  origin: supabaseOrigin,
  websocketOrigin:
    supabaseWebsocketOrigin,
  hostname:
    supabaseHostname,
} = getSupabaseInfo();

const connectSources = [
  "'self'",
  supabaseOrigin,
  supabaseWebsocketOrigin,

  // Next.js hot reload in development.
  ...(isDev
    ? ["ws:", "http:"]
    : []),
]
  .filter(Boolean)
  .join(" ");

const imageSources = [
  "'self'",
  "blob:",
  "data:",
  supabaseOrigin,
]
  .filter(Boolean)
  .join(" ");

const mediaSources = [
  "'self'",
  "blob:",
  supabaseOrigin,
]
  .filter(Boolean)
  .join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",

  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",

  "style-src 'self' 'unsafe-inline'",

  `img-src ${imageSources}`,

  "font-src 'self' data:",

  `connect-src ${connectSources}`,

  `media-src ${mediaSources}`,

  "object-src 'none'",

  "base-uri 'self'",

  "form-action 'self'",

  "frame-ancestors 'none'",

  "frame-src 'none'",

  "worker-src 'self' blob:",

  "manifest-src 'self'",

  ...(!isDev
    ? [
        "upgrade-insecure-requests",
      ]
    : []),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      contentSecurityPolicy,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value:
      "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },

  ...(!isDev
    ? [
        {
          key: "Strict-Transport-Security",
          value:
            "max-age=31536000",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // Do not advertise that the site runs on Next.js.
  poweredByHeader: false,

  // Allow larger Server Action form submissions.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },

  images: {
    remotePatterns:
      supabaseHostname
        ? [
            {
              protocol:
                "https",
              hostname:
                supabaseHostname,
              pathname:
                "/storage/v1/object/public/**",
            },
          ]
        : [],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers:
          securityHeaders,
      },
    ];
  },
};

export default nextConfig;