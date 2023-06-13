// Import everything needed to use the `useQuery` hook
import { useMutation, gql } from '@apollo/client';

const UPLOAD_FILE = gql`mutation UPLOAD($file: File!){
  upload(file: $file){
    cid
    id
    type
    url
    updatedAt
    createdAt
  }
}`;

export default function App() {
  const [uploadMutation, { data, loading, error }] = useMutation(UPLOAD_FILE, {
    onCompleted: result => {
      console.log('UPLOAD_FILE complete: ', result);
    },
    onError: error => {
      console.error('useUploadFile error: ', error);
      console.log('json error: ', JSON.stringify(error));
    },
  });

  return (
    <div>
      <h2>My first Apollo app 🚀</h2>
      <input
        type="file"
        onChange={e => {
          const file = e.target.files[0];
          console.log('file: ', file);
          uploadMutation({ variables: { file } });
        }}
      />
    </div>
  );
}
