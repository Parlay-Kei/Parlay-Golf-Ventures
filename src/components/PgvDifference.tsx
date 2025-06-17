
import { Upload, GraduationCap, Package, Flag, Bot } from "lucide-react";
import { Link } from "react-router-dom";

const PgvDifference = () => {
  return (
    <section className="py-16 bg-pgv-sand/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">What Makes PGV Different?</h2>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start gap-3">
            <div className="text-pgv-green p-2">
              <Upload size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Talent Discovery: <Link to="/upload" className="text-blue-600 hover:underline">Upload your swing</Link>
              </h3>
              <p className="text-gray-600">Get noticed. Get feedback.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start gap-3">
            <div className="text-pgv-green p-2">
              <GraduationCap size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                PGV Academy:
              </h3>
              <p className="text-gray-600">Online mentorship & player development resources.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start gap-3">
            <div className="text-pgv-green p-2">
              <Package size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Thrift-to-Tour Pipeline:
              </h3>
              <p className="text-gray-600">Access to gear, grants, and golf essentials.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start gap-3">
            <div className="text-pgv-green p-2">
              <Flag size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Virtual Competitions:
              </h3>
              <p className="text-gray-600">Compete. Rank up. Get seen.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start gap-3">
            <div className="text-pgv-green p-2">
              <Bot size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Caddy Sage AI:
              </h3>
              <p className="text-gray-600">Your 24/7 golf wisdom guide.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PgvDifference;
