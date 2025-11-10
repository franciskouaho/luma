import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Privacy Policy for Luma Post
            </h1>
            <p className="text-gray-600">
              Last Updated: 2025-10-16
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Thank you for using Luma Post ("we," "us," or "our"). This Privacy Policy outlines how we collect, use, and protect your personal and non-personal information when you use our website located at https://luma-post.com (the "Website").
            </p>
            
            <p className="text-gray-700 mb-6">
              By accessing or using the Website, you agree to the terms of this Privacy Policy. If you do not agree with the practices described in this policy, please do not use the Website.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Information We Collect
                </h2>
                
                <div className="text-gray-700 space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      1.1 Personal Data
                    </h3>
                    <p className="mb-3">We collect the following personal information from you:</p>
                    <ul className="list-disc list-inside ml-4 space-y-2">
                      <li><strong>Name:</strong> We collect your name to personalize your experience and communicate with you effectively.</li>
                      <li><strong>Email:</strong> We collect your email address to send you important information regarding your account, updates, and communication.</li>
                      <li><strong>Payment Information:</strong> We collect payment details to process your orders securely.</li>
                      <li><strong>Social Media Authentication Access Keys:</strong> We collect these to enable cross-posting functionality to your social media accounts.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      1.2 Non-Personal Data
                    </h3>
                    <p>
                      We use web cookies to collect non-personal information such as your IP address, browser type, device information, and browsing patterns. This information helps us to enhance your browsing experience, analyze trends, and improve our services.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Purpose of Data Collection
                </h2>
                <p className="text-gray-700">
                  We collect and use your personal data for order processing and social media posting. This includes processing your orders, enabling cross-posting functionality, sending confirmations, providing customer support, and keeping you updated about the status of your account and posts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. YouTube API Services
                </h2>
                <p className="text-gray-700">
                  Luma Post uses YouTube API Services to enable cross-posting functionality to YouTube. By using our service to interact with YouTube, you are also subject to the{' '}
                  <a 
                    href="https://www.youtube.com/t/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    YouTube Terms of Service
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Google Privacy Policy
                </h2>
                <p className="text-gray-700">
                  As we use YouTube API Services, your data may also be subject to Google's Privacy Policy. For more information on how Google collects and processes data, please refer to the{' '}
                  <a 
                    href="http://www.google.com/policies/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Google Privacy Policy
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Data Sharing
                </h2>
                <p className="text-gray-700">
                  We do not share your personal data with any other parties except as required for order processing and social media posting functionality. This may include sharing necessary data with the social media platforms you choose to post to, including YouTube through the YouTube API Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Children's Privacy
                </h2>
                <p className="text-gray-700">
                  Luma Post is not intended for children, and we do not collect any data from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Updates to the Privacy Policy
                </h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. Users will be notified of any changes via email.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Contact Information
                </h2>
                <p className="text-gray-700">
                  If you have any questions, concerns, or requests related to this Privacy Policy, you can contact us at:
                </p>
                <p className="text-gray-700 mt-2">
                  Email:{' '}
                  <a 
                    href="mailto:contact@emplica.fr"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    contact@emplica.fr
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Data Protection Mechanisms
                </h2>
                <p className="text-gray-700 mb-4">
                  We take the protection of your sensitive data seriously and have implemented the following security measure:
                </p>
                <div className="text-gray-700 space-y-3">
                  <p><strong>a) Encryption:</strong> Your Google OAuth access keys are encrypted using industry-standard encryption protocols both in transit and at rest.</p>
                  <p className="text-sm text-gray-600 italic">
                    While we implement this security measure to protect your sensitive information, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure. We strive to use commercially acceptable means to protect your personal information, but we cannot guarantee its absolute security.
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-lg font-medium text-gray-900 text-center">
                By using Luma Post, you consent to the terms of this Privacy Policy.
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
