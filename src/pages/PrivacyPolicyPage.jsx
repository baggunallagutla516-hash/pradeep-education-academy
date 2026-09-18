import { Link } from 'react-router-dom';
import { SITE } from '../constants/site';
import { PageShell } from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const sections = [
  {
    title: '1. Information we collect',
    body: [
      'When you register or use this portal, we may collect details such as your name, email address, phone number, class/grade, school information, and account credentials.',
      'Parents may provide child-linking details so they can view permitted student progress. Educators and admins may have additional profile information needed to manage learning content.',
      'When you attempt quizzes, assessments, DPPs, slip tests, or similar activities, we store your answers, scores, attempt history, and related results.',
      'If you contact us through the contact form, WhatsApp, or email, we collect the information you choose to share so we can respond.',
    ],
  },
  {
    title: '2. How we use your information',
    body: [
      'We use your information to create and manage accounts, deliver learning materials, run exams and practice tests, show results and progress, and issue certificates where applicable.',
      'We also use contact details to send important account notices (such as password reset messages) and to respond to support requests.',
      'Site analytics such as visitor counts may be used in aggregate to understand usage and improve the platform.',
    ],
  },
  {
    title: '3. Sharing of information',
    body: [
      'We do not sell your personal information.',
      'Student progress and results may be visible to authorised parents linked to that student, and to educators or administrators who manage the academy’s learning programs.',
      'We may share information with service providers who help us operate the platform (for example, hosting or email delivery), only as needed to provide those services.',
      'We may disclose information if required by law or to protect the rights, safety, and integrity of students, parents, educators, and the academy.',
    ],
  },
  {
    title: '4. Data security',
    body: [
      'We take reasonable technical and organisational measures to protect account and learning data against unauthorised access, alteration, or loss.',
      'No online service can guarantee absolute security. Please keep your login credentials confidential and log out from shared devices.',
    ],
  },
  {
    title: '5. Cookies and local storage',
    body: [
      'The portal may use browser storage (such as cookies or local storage) to keep you signed in, remember session preferences, and support basic site functionality.',
      'You can control cookies through your browser settings, but disabling them may affect login and other features.',
    ],
  },
  {
    title: '6. Children’s privacy',
    body: [
      'This platform is designed for school students and related parent/educator accounts.',
      'Registration and use by younger students should be done with appropriate parental or guardian awareness. Parents who link to a student account can review permitted learning activity for that child.',
    ],
  },
  {
    title: '7. Your choices',
    body: [
      'You may update account profile details from your account settings where available.',
      'If you need help correcting information, deleting an account, or unlinking a parent–student connection, contact us using the details below and we will assist as reasonably possible.',
    ],
  },
  {
    title: '8. Changes to this policy',
    body: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.',
      'The “Last updated” date at the top of this page will change when revisions are published. Continued use of the portal after an update means you accept the revised policy.',
    ],
  },
];

export function PrivacyPolicyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description={`How ${SITE.name} collects, uses, and protects information on this learning portal.`}
      actions={
        <Link to="/contact">
          <Button variant="secondary">Contact us</Button>
        </Link>
      }
    >
      <Card className="mb-6 bg-lagoon-50/70">
        <p className="text-sm font-semibold text-ink-900">Last updated: 18 September 2026</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-900/70">
          This policy applies to the website and student learning services operated by {SITE.name}.
          By creating an account or using the portal, you agree to the practices described here.
        </p>
      </Card>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title}>
            <h2 className="font-display text-xl font-bold text-ink-900">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-ink-900/70">
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>
        ))}

        <Card>
          <h2 className="font-display text-xl font-bold text-ink-900">9. Contact</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-900/70">
            For privacy questions or requests, reach {SITE.name} at{' '}
            <a className="font-medium text-lagoon-700 hover:underline" href={`mailto:${SITE.supportEmail}`}>
              {SITE.supportEmail}
            </a>{' '}
            or on WhatsApp at{' '}
            <a
              className="font-medium text-lagoon-700 hover:underline"
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SITE.whatsappNumber}
            </a>
            . You can also use our{' '}
            <Link className="font-medium text-lagoon-700 hover:underline" to="/contact">
              contact page
            </Link>
            .
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
