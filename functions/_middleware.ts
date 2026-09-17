export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);
  if (url.hostname === 'www.petruseva.com') {
    url.hostname = 'petruseva.com';
    return Response.redirect(url.toString(), 301);
  }

  const response = await next();
  const secured = new Response(response.body, response);
  secured.headers.set('X-Content-Type-Options', 'nosniff');
  secured.headers.set('X-Frame-Options', 'SAMEORIGIN');
  secured.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  secured.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return secured;
};
