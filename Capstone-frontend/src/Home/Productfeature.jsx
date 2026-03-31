import React from "react";
import herbsOnTable from '../assets/Hero Images/Herbsontable.jpg'

const features = [
  { name: "Origin", description: "Grown in local organic farm" },
  {
    name: "Farming Method",
    description:
      "100% chemical-free and organic cultivation practices"
  },
  { name: "Ethical Standards", description: 'Fair trade certified with ethical planting and harvesting' },
  {
    name: "Sustainability",
    description: "Regenerative farming techniques that enrich the soil"
  },
  { name: "Harvesting", description: "Hand-picked at peak freshness locally" },
  {
    name: "Certification",
    description:
      "USDA Organic Certified and Non-GMO Project Verified"
  },
];

export default function Productfeature() {
  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-6 gap-y-12 px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:grid-cols-2 lg:px-8">
        {/* Left Side - Specifications */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Our Commitment to Purity
          </h2>

          <p className="mt-3 text-gray-500">
            Every herb in our collection is grown using traditional, chemical-free farming methods 
            that have been passed down through generations. We partner with local farmers who share 
            our dedication to ethical planting practices and environmental stewardship.
          </p>

          <dl className="mt-12 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-y-12 lg:gap-x-6">
            {features.map((feature) => (
              <div key={feature.name} className="border-t border-gray-200 pt-3">
                <dt className="font-medium text-gray-900">
                  {feature.name}
                </dt>
                <dd className="mt-1 text-sm text-gray-500">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right Side - Single Hero Image */}
        <div className="flex justify-center">
          <img
            alt="Fresh organic herbs on a rustic wooden table, showcasing our chemical-free farming results"
            src={herbsOnTable}
            className="w-full h-auto rounded-lg bg-gray-100 shadow-xl object-cover max-h-[600px]"
          />
        </div>
      </div>
    </div>
  );
}