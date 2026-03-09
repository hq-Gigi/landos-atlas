import AudiencePage from '../../components/design/AudiencePage';

export default function Page() {
  return <AudiencePage title="For Investors" copy="Understand opportunity quality with visibility into scenario upside, downside, and feasibility confidence." bullets={[{ title: 'Portfolio risk mapping', copy: 'Compare projects by margin confidence, liquidity profile, and timeline risk.' }, { title: 'Capital intelligence', copy: 'Inspect capex structures and sensitivity ranges before commitments.' }, { title: 'Boardroom narratives', copy: 'Generate structured memos from auditable model outputs and recommendations.' }, { title: 'Execution confidence', copy: 'Track progress from parcel review through scenario implementation and returns.' }]} />;
}
