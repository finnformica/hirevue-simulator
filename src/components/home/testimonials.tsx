import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah",
      role: "Associate Consultant",
      company: "Deloitte",
      content:
        "GradGuru helped me prepare for my HireVue interview perfectly. The AI feedback was incredibly detailed and helped me improve my responses significantly.",
      rating: 5,
    },
    {
      name: "Michael",
      role: "Data Analyst",
      company: "JP Morgan",
      content:
        "The industry-specific prompts were spot on. I felt so much more confident going into my interview knowing I had practiced with relevant questions.",
      rating: 5,
    },
    {
      name: "Emily",
      role: "Associate Consultant",
      company: "PwC",
      content:
        "The automated analysis feature is amazing. It caught things I never would have noticed about my delivery and body language.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="w-full bg-black py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of graduates who have successfully landed their dream
            jobs with GradGuru.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500/50 transition-colors flex flex-col"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic grow">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-gray-400 text-sm">
                  {testimonial.role} at {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
