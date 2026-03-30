import { useNavigate } from 'react-router-dom';
import { useDigestWizard } from '../../hooks/useDigestWizard';
import DigestContentsAccordion from './DigestContentsAccordion';

export default function ContentStep() {
  const navigate = useNavigate();
  const { digestId } = useDigestWizard();
  return (
    <DigestContentsAccordion
      digestId={digestId}
      onCreatedDigest={(createdDigestId) =>
        navigate(`/${createdDigestId}/content`, {
          state: { closeContentAccordion: true },
        })
      }
    />
  );
}
