import PageShell from '../../../../components/design/PageShell';
import ProjectWorkspace from '../../../../components/design/ProjectWorkspace';

export default function Page({ projectId }) { return <PageShell><ProjectWorkspace projectId={projectId} section="reports" /></PageShell>; }
export async function getServerSideProps({ params }) { return { props: { projectId: params.projectId } }; }
