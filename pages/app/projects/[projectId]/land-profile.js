import { requirePageAuth } from '../../../../lib/ssrAuth';
import PageShell from '../../../../components/design/PageShell';
import ProjectWorkspace from '../../../../components/design/ProjectWorkspace';

export default function Page({ projectId }) { return <PageShell><ProjectWorkspace projectId={projectId} section="land-profile" /></PageShell>; }
export const getServerSideProps = requirePageAuth(({ params }) => ({ projectId: params.projectId }));
