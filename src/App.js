import { gql, useSubscription } from '@apollo/client';

const COUNT_SUB = gql`subscription COUNT_SUB($from: Int!){
  countSub(from: $from){
    count
  }
}`;

export default function App() {
  const { data, loading } = useSubscription(COUNT_SUB, {
    variables: { from: 1 },
  });
  return (
    <div>
      <h2>Counter</h2>
      <h4>{!loading && data?.countSub?.count}</h4>
    </div>
  );
}
