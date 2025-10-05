"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("customers");
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "", priority: "medium" });
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        fetchData();
      }
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      // Mock customers data (in real app, this would come from a users table)
      const mockCustomers = [
        {
          id: "1",
          email: "testuser@example.com",
          name: "John Doe",
          phone: "+233123456789",
          created_at: new Date().toISOString(),
          total_orders: 0,
          total_spent: 0,
          status: "active"
        }
      ];

      // Fetch support tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) {
        setTickets([]);
      } else {
        setTickets(ticketsData || []);
      }

      setCustomers(mockCustomers);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.message) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([
          {
            customer_email: selectedCustomer?.email || "testuser@example.com",
            subject: newTicket.subject,
            message: newTicket.message,
            priority: newTicket.priority,
            status: "open",
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        alert("Error creating ticket");
      } else {
        setNewTicket({ subject: "", message: "", priority: "medium" });
        fetchData();
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) {
        // Handle error silently
      } else {
        fetchData();
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const sendMessage = async (customerId: string) => {
    if (!newMessage.trim()) return;

    try {
      const { data, error } = await supabase
        .from('customer_messages')
        .insert([
          {
            customer_id: customerId,
            message: newMessage,
            sender: "admin",
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        alert("Error sending message");
      } else {
        setNewMessage("");
        alert("Message sent to customer!");
      }
    } catch (error) {
      // Handle error silently
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Customer Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("customers")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "customers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Customers ({customers.length})
              </button>
              <button
                onClick={() => setActiveTab("tickets")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tickets"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Support Tickets ({tickets.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Customer Profiles</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`p-6 cursor-pointer hover:bg-gray-50 ${
                        selectedCustomer?.id === customer.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{customer.name}</h4>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {customer.total_orders} orders
                          </p>
                          <p className="text-sm text-gray-500">₵{customer.total_spent}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {customer.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Details & Messaging */}
            <div className="space-y-6">
              {selectedCustomer && (
                <>
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
                    </div>
                    <div className="p-6">
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Name</dt>
                          <dd className="text-sm text-gray-900">{selectedCustomer.name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="text-sm text-gray-900">{selectedCustomer.email}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Phone</dt>
                          <dd className="text-sm text-gray-900">{selectedCustomer.phone}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                          <dd className="text-sm text-gray-900">
                            {new Date(selectedCustomer.created_at).toLocaleDateString()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-medium text-gray-900">Send Message</h3>
                    </div>
                    <div className="p-6">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                      <button
                        onClick={() => sendMessage(selectedCustomer.id)}
                        className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Support Tickets Tab */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Support Tickets</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <div key={ticket.id} className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{ticket.subject}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              ticket.priority === "high" 
                                ? "bg-red-100 text-red-800"
                                : ticket.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {ticket.priority}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              ticket.status === "open" 
                                ? "bg-blue-100 text-blue-800"
                                : ticket.status === "in-progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ticket.customer_email}</p>
                        <p className="text-sm text-gray-900 mb-3">{ticket.message}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateTicketStatus(ticket.id, "in-progress")}
                            className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => updateTicketStatus(ticket.id, "resolved")}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">No support tickets</div>
                  )}
                </div>
              </div>
            </div>

            {/* Create Ticket */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Create Support Ticket</h3>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Message"
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <button
                  onClick={createTicket}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}