
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const AcademyDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-pgv-green text-white py-12 md:py-16 px-4 text-center">
          <div className="container mx-auto max-w-4xl">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">My PGV Academy Dashboard</h1>
            <p className="text-lg">Track your progress. Stay accountable. Level up.</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10 md:py-12 max-w-4xl">
          {/* Course Progress Section */}
          <section className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-pgv-green mb-4">My Course Progress</h2>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Short Game Secrets</TableCell>
                    <TableCell>In Progress</TableCell>
                    <TableCell>
                      <div className="w-full flex items-center gap-2">
                        <Progress value={60} className="h-2" />
                        <span className="text-sm whitespace-nowrap">60%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Breaking Down the Basics</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>
                      <div className="w-full flex items-center gap-2">
                        <Progress value={100} className="h-2" />
                        <span className="text-sm whitespace-nowrap">100%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mastering the Mental Game</TableCell>
                    <TableCell>Not Started</TableCell>
                    <TableCell>
                      <div className="w-full flex items-center gap-2">
                        <Progress value={0} className="h-2" />
                        <span className="text-sm whitespace-nowrap">0%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Mentor Notes Section */}
          <section className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-pgv-green mb-4">My Mentor Notes</h2>
            <p className="text-gray-700 mb-6">
              No notes yet. Schedule a mentor review to get personalized feedback.
            </p>
            <Link to="/academy/schedule-review">
              <Button className="bg-pgv-green hover:bg-pgv-green/90">
                BOOK MENTOR REVIEW
              </Button>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyDashboard;
