const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

async function fetchJobs() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs`);
    const jobs = await response.json();
    displayJobs(jobs);
  } catch (e) {
    console.error("Failed to fetch jobs", e);
    return []; //
  }
}

async function addJob(job) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });
    if (response.ok) {
      console.log("Job added successfully");
    } else {
      console.error("Failed to add job");
    }
  } catch (error) {
    console.error("Failed to add job", error);
  }
}

async function editJob(job) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs/${job._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });
    if (response.ok) {
      console.log("Job updated successfully");
    } else {
      console.error("Failed to update job");
    }
  } catch (error) {
    console.error("Failed to update job", error);
  }
}

async function deleteJob(job) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/jobs/${job._id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      console.log("Job deleted successfully");
    } else {
      console.error("Failed to delete job");
    }
  } catch (error) {
    console.error("Failed to delete job", error);
  }
}
// commented out temp until get back to baseline with new changes

/* //EDIT Job
async function editJob(jobId) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/jobs/${jobId}`);
      const job = await response.json();
      document.querySelector("#jobName").value = job.jobName;
      document.querySelector("#client").value = job.client;
      document.querySelector("#location").value = job.location;
      document.querySelector("#startDate").value = job.startDate;
      document.querySelector("#endDate").value = job.endDate;
      //document.querySelector("#travelDays").value = job.travelDays;
      //document.querySelector("#isRTW").checked = job.isRTW;
  
      //Change Form Submission to Handle Update
      document.querySelector("job-form").setAttribute("data-job-id", jobID);
    } catch (error) {
      console.error("Failed to fetch job", error);
    }
  }
  
  //DELETE job
  async function deleteJob(jobId) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log("Job deleted successfully");
        fetchJobs();
      } else {
        console.error("Failed to delete job");
      }
    } catch (error) {
      console.error("Failed to delete job", error);
    }
  } */

export { fetchJobs, addJob, editJob, deleteJob };
