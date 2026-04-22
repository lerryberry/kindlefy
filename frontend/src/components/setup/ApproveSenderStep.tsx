import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDigestWizard } from '../../hooks/useDigestWizard';
import Button from '../util/Button';

const APPROVED_SENDER_EMAIL = 'eschapple.projects@gmail.com';
const AMAZON_APPROVED_SENDERS_URL =
  'https://www.amazon.com.au/hz/mycd/preferences/myx#/home/settings/payment';

const Intro = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  max-width: 600px;
`;

const Steps = styled.ol`
  margin: 0 0 1.25rem 0;
  padding-left: 1.25rem;
  color: var(--color-text-primary);
  line-height: 1.5;
  max-width: 600px;

  li {
    margin-bottom: 0.75rem;
  }

  li:last-child {
    margin-bottom: 0;
  }
`;

const LinkRow = styled.div`
  margin-top: 0.35rem;
`;

const EmailRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.35rem;
`;

const EmailMono = styled.code`
  font-size: 0.9rem;
  padding: 0.2rem 0.45rem;
  border-radius: 0.35rem;
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  word-break: break-all;
`;

const NextRow = styled.div`
  margin-top: 1.5rem;
`;

export default function ApproveSenderStep() {
  const navigate = useNavigate();
  const { digestId } = useDigestWizard();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(APPROVED_SENDER_EMAIL);
      toast.success('Email copied');
    } catch {
      toast.error('Could not copy — select and copy the address manually');
    }
  };

  return (
    <>
      <Intro>
        Kindle only accepts documents from approved senders. Add our address to your Amazon
        account so digests can be delivered.
      </Intro>
      <Steps>
        <li>
          Open your{' '}
          <a
            href={AMAZON_APPROVED_SENDERS_URL}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-text-primary)', textDecoration: 'underline' }}
          >
            Approved Personal Document E-mail List
          </a>
          <LinkRow>(sign in to Amazon if prompted).</LinkRow>
        </li>
        <li>
          Add this address to the list as an approved sender:
          <EmailRow>
            <EmailMono>{APPROVED_SENDER_EMAIL}</EmailMono>
            <Button type="button" text="Copy" size="small" variant="ghost" onClick={() => void copyEmail()} />
          </EmailRow>
        </li>
      </Steps>
      <NextRow>
        <Button
          type="button"
          text="Next"
          size="medium"
          isResponsive
          disabled={!digestId}
          onClick={() => navigate(`/${digestId}/confirm`)}
        />
      </NextRow>
    </>
  );
}
