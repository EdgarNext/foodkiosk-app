const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const remotePatterns = [];

if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      pathname: "/**"
    });
  } catch {
    // Ignorar URL inválida; Next seguirá usando assets locales.
  }
}

// Permite las imágenes estáticas usadas por la data legacy.
remotePatterns.push({
  protocol: "https",
  hostname: "tb-static.uber.com",
  pathname: "/**"
});

remotePatterns.push({
  protocol: "https",
  hostname: "superfarmaciacoronado.com.mx",
  pathname: "/**"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns
  }
};

export default nextConfig;
