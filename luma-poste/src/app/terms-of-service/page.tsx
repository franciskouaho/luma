import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Terms and Conditions for Luma Post
            </h1>
            <p className="text-gray-600">
              Last Updated: 2025-10-16
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Welcome to Luma Post!
            </p>
            
            <p className="text-gray-700 mb-6">
              These Terms of Service ("Terms") govern your use of the Luma Post website at https://luma-post.com ("Website") and the services provided by Luma Post. By using our Website and services, you agree to these Terms.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Description of Luma Post
                </h2>
                <p className="text-gray-700">
                  Luma Post is a tool that allows users to cross-post and upload content to all social media platforms from one place.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. YouTube Terms of Service
                </h2>
                <p className="text-gray-700">
                  By using Luma Post to interact with YouTube services, you also agree to be bound by the{' '}
                  <a 
                    href="https://www.youtube.com/t/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    YouTube Terms of Service
                  </a>
                  . This includes any use of the YouTube API services through our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. User Data and Privacy
                </h2>
                <p className="text-gray-700">
                  We collect and store user data, including name, email, payment information, and social media authentication access keys, as necessary to provide our services. For details on how we handle your data, please refer to our{' '}
                  <Link 
                    href="/privacy-policy" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Non-Personal Data Collection
                </h2>
                <p className="text-gray-700">
                  We use web cookies to collect non-personal data for the purpose of improving our services and user experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Ownership and Usage Rights
                </h2>
                <p className="text-gray-700">
                  When you purchase a package from Luma Post, you can sign in to your social media accounts and authorize access to your data to post to the platforms connected to the Luma Post app. You retain ownership of your content, but grant us the necessary rights to post on your behalf.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Refund Policy
                </h2>
                <p className="text-gray-700">
                  We offer a full refund within 24 hours after the purchase. To request a refund, please contact us at{' '}
                  <a 
                    href="mailto:contact@emplica.fr"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    contact@emplica.fr
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Children's Privacy
                </h2>
                <p className="text-gray-700">
                  Luma Post is not intended for use by children, and we do not knowingly collect any data from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Updates to the Terms
                </h2>
                <p className="text-gray-700">
                  We may update these Terms from time to time. Users will be notified of any changes via email.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Governing Law
                </h2>
                <p className="text-gray-700">
                  These Terms are governed by the laws of Canada.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  10. Contact Information
                </h2>
                <p className="text-gray-700">
                  For any questions or concerns regarding these Terms of Service, please contact us at{' '}
                  <a 
                    href="mailto:contact@emplica.fr"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    contact@emplica.fr
                  </a>
                  .
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-lg font-medium text-gray-900 text-center">
                Thank you for using Luma Post!
              </p>
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
