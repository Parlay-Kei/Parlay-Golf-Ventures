import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import withErrorBoundary from '@/components/withErrorBoundary'

type AcademyUser = {
  id: string
  name: string
  email: string
  skill_level: string
  goals: string
  learning_style: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default withErrorBoundary(function AdminDashboard() {
  const [applications, setApplications] = useState<AcademyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<AcademyUser | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('academy_users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function updateApplicationStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    try {
      setActionInProgress(id)
      
      const { error } = await supabase
        .from('academy_users')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state to reflect the change
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status } : app
      ))
      
      // Also update the selected application if it's the one being modified
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication({ ...selectedApplication, status })
      }
      
      toast({
        title: `Application ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Reset'}`,
        description: `Successfully ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'reset'} the application.`,
      })
    } catch (error) {
      console.error(`Error updating application status:`, error)
      toast({
        title: "Error",
        description: `Failed to update the application status. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  function viewApplicationDetails(application: AcademyUser) {
    setSelectedApplication(application)
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Academy Applications</CardTitle>
              <CardDescription>
                Manage applications for PGV Academy
              </CardDescription>
            </div>
            <Button onClick={() => fetchApplications()} disabled={loading}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Skill Level</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => viewApplicationDetails(application)}
                          >
                            {application.name}
                          </Button>
                        </TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell className="capitalize">{application.skill_level}</TableCell>
                        <TableCell>{formatDate(application.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {application.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                  onClick={() => updateApplicationStatus(application.id, 'approved')}
                                  disabled={actionInProgress === application.id}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                                  onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                  disabled={actionInProgress === application.id}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {(application.status === 'approved' || application.status === 'rejected') && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateApplicationStatus(application.id, 'pending')}
                                disabled={actionInProgress === application.id}
                              >
                                Reset to Pending
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Application Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-3">
                  {selectedApplication.name}
                  {getStatusBadge(selectedApplication.status)}
                </DialogTitle>
                <DialogDescription>
                  Application submitted on {formatDate(selectedApplication.created_at)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Contact Information</h3>
                  <p className="mt-1">{selectedApplication.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Skill Level</h3>
                  <p className="mt-1 capitalize">{selectedApplication.skill_level}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Goals & Bio</h3>
                  <p className="mt-1 whitespace-pre-line">{selectedApplication.goals}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Preferred Learning Style</h3>
                  <p className="mt-1 capitalize">{selectedApplication.learning_style}</p>
                </div>
                
                <div className="pt-4 border-t flex justify-end space-x-2">
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                        disabled={actionInProgress === selectedApplication.id}
                      >
                        Approve Application
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                        disabled={actionInProgress === selectedApplication.id}
                      >
                        Reject Application
                      </Button>
                    </>
                  )}
                  {selectedApplication.status === 'approved' && (
                    <Button 
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'pending')}
                      disabled={actionInProgress === selectedApplication.id}
                    >
                      Reset to Pending
                    </Button>
                  )}
                  {selectedApplication.status === 'rejected' && (
                    <Button 
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'pending')}
                      disabled={actionInProgress === selectedApplication.id}
                    >
                      Reset to Pending
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}, 'admin-dashboard') 