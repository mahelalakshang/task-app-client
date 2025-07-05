"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const statusColors = {
  pending: "text-yellow-500",
  "in-progress": "text-blue-500",
  completed: "text-green-600",
};

const priorityColors = {
  low: "text-gray-500",
  medium: "text-orange-500",
  high: "text-red-500",
};

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState(null);
  const [newstatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
  });

  const router = useRouter();

  useEffect(() => {
    const newtoken = localStorage?.getItem("access_token");
    setToken(newtoken as any);
  }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem("access_token");
  //   if (token) {
  //     router.push("/");
  //   }
  // }, [router]);

  const fetchTasks = async (status = "", priority = "") => {
    setTasks([]);
    let query = "";
    if (status) query += `status=${status}`;
    if (priority) query += `${query ? "&" : ""}priority=${priority}`;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks${query ? "?" + query : ""}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Task Created",
      });
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
      });
      fetchTasks();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create task",
      });
    }
  };

  const handleTaskUpdate = async (id: number, key: string, value: string) => {
    const updatedTasks = tasks.map((task: Task) =>
      task.id === id ? { ...task, [key]: value } : task
    );
    setTasks(updatedTasks as any); // update local state

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${id}/${key}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      }
    );

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update task",
      });
      // Revert optimistic update if needed
      fetchTasks();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
        <Input
          placeholder="Description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            value={formData.status}
            onValueChange={(value) => {
              handleChange("status", value);
              console.log("Status changed to", value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={formData.priority}
            onValueChange={(value) => {
              handleChange("priority", value);
              console.log("Priority changed to", value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          Create Task
        </Button>
      </form>

      <h3 className="text-xl font-semibold mt-8 mb-4">Task List</h3>
      <div className="mb-4 flex gap-2">
        <div>
          <Select
            value={newstatus}
            onValueChange={(value) => {
              setNewStatus(value);
              setNewPriority(" ");
              fetchTasks(value, "");
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={newPriority}
            onValueChange={(value) => {
              setNewPriority(value);
              setNewStatus(" ");
              fetchTasks("", value);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.length > 0 &&
          tasks?.map((task) => (
            <div
              key={(task as Task).id}
              className="p-4 border rounded-xl bg-white shadow-sm"
            >
              <h4 className="text-lg font-bold">{(task as Task).title}</h4>
              <p className="text-gray-600 mb-1">{(task as Task).description}</p>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={(task as Task).status}
                  onValueChange={(value) => {
                    handleTaskUpdate((task as Task).id, "status", value);
                    console.log("Status changed to", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={(task as Task).priority}
                  onValueChange={(value) => {
                    handleTaskUpdate((task as Task).id, "priority", value);
                    console.log("Priority changed to", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
