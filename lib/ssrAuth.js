import { resolveUserFromRequest } from './auth';

export function requirePageAuth(mapProps) {
  return async function getServerSideProps(ctx) {
    const user = await resolveUserFromRequest(ctx.req);
    if (!user) {
      const next = encodeURIComponent(ctx.resolvedUrl || '/app');
      return { redirect: { destination: `/login?next=${next}`, permanent: false } };
    }

    const extra = mapProps ? await mapProps(ctx, user) : {};
    return { props: { ...(extra || {}) } };
  };
}
