import PageShell from '../../../../components/design/PageShell';
import ProjectWorkspace from '../../../../components/design/ProjectWorkspace';

export default function ProjectOverview({ projectId }) {
  return <PageShell><ProjectWorkspace projectId={projectId} section="overview" /></PageShell>;
}

export async function getServerSideProps({ params }) { return { props: { projectId: params.projectId } }; }
