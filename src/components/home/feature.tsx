import { BarChart3, FileText, MessageSquare, Zap } from "lucide-react";
export function FeatureSection() {
  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-green-400" />,
      title: "Industry-Specific Prompts",
      description:
        "Access a wide range of interview questions tailored to major graduate employers across different industries.",
      detail:
        "Our database includes real questions from top companies that regularly recruit graduates.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-green-400" />,
      title: "Automated Analysis",
      description:
        "Get instant AI-powered analysis of your interview responses including speech patterns, confidence, and clarity.",
      detail:
        "Our technology evaluates both what you say and how you say it to provide comprehensive feedback.",
    },
    {
      icon: <Zap className="h-10 w-10 text-green-400" />,
      title: "Actionable Feedback",
      description:
        "Receive personalised tips to improve your responses and boost your interview performance score.",
      detail:
        "Learn exactly what recruiters are looking for and how to structure your answers for maximum impact.",
    },
    {
      icon: <FileText className="h-10 w-10 text-green-400" />,
      title: "Interview Documentation",
      description:
        "Access guides and resources covering all aspects of the interview process beyond HireVue.",
      detail:
        "From assessment centers to final interviews, we've got you covered with expert advice every step of the way.",
    },
  ];
  return (
    <section id="features" className="w-full bg-black py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our comprehensive platform gives you all the tools and knowledge to
            ace your interviews.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500/50 transition-colors"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 mb-4">{feature.description}</p>
              <p className="text-sm text-gray-500">{feature.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 bg-gradient-to-r from-green-500/20 to-green-500/5 border border-green-500/30 rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-3/5 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4">How GradGuru Works</h3>
              <ol className="space-y-4">
                <li className="flex">
                  <span className="bg-green-500 text-black h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    1
                  </span>
                  <p className="text-gray-300">
                    Select from our library of industry-specific interview
                    prompts
                  </p>
                </li>
                <li className="flex">
                  <span className="bg-green-500 text-black h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    2
                  </span>
                  <p className="text-gray-300">
                    Record your responses just like in a real HireVue interview
                  </p>
                </li>
                <li className="flex">
                  <span className="bg-green-500 text-black h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    3
                  </span>
                  <p className="text-gray-300">
                    Receive instant analysis and feedback on your performance
                  </p>
                </li>
                <li className="flex">
                  <span className="bg-green-500 text-black h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    4
                  </span>
                  <p className="text-gray-300">
                    Practice, improve and track your progress over time
                  </p>
                </li>
              </ol>
            </div>
            <div className="md:w-2/5">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="aspect-square md:aspect-video rounded-md bg-gray-900 flex items-center justify-center">
                  <div className="text-gray-500 text-sm">Interactive demo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
