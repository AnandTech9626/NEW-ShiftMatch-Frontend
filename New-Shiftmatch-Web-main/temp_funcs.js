const handleSubmitDocument = async () => {
    try {
      setIsUploading(true);


      if (!isEditMode) {
        if (!selectedDocument?._id || !selectedFile) {
          notify(false, "Please select document and file");
          return;
        }

        const isExpiryRequired = !!(uploadDrawerDoc?.isExipreDate || selectedDocument?.isExipreDate);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("documentTypeId", selectedDocument._id);
        formData.append("hospitalId", sessionStorage.getItem("userId")); // ✅ IMPORTANT
        formData.append("issuedBy", issuedBy);
        formData.append("issueDate", issueDate);
        if (isExpiryRequired) {
          formData.append("expiryDate", expiryDate);
        }

        const res = await fetch(
          `${baseUrl}${urls?.document?.upload}${sessionStorage.getItem("userId")}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: formData,
          }
        );

        const data = await res.json();

        if (!res.ok) {
          notify(false, data.message || "Upload failed");
          return;
        }

        notify(true, "Document uploaded successfully");

        // Optimistically update state so badge shows immediately
        const newDoc = {
          ...data.data,
          documentName: selectedDocument?.name || selectedDocument?.documentName || "",
          documentTypeId: selectedDocument._id,
        };
        const uId = sessionStorage.getItem("userId");
        setUploadedDocuments((prev) => {
          const filtered = prev.filter(
            (d) => String(d.documentTypeId) !== String(selectedDocument._id)
          );
          const updated = [...filtered, newDoc];
          if (uId) {
            localStorage.setItem(`uploaded_docs_${uId}`, JSON.stringify(updated));
          }
          return updated;
        });
      }


      else {
        if (!selectedUploadedDoc?._id) {
          notify(false, "No document selected");
          return;
        }

        const isExpiryRequired = !!uploadDrawerDoc?.isExipreDate;

        const bodyData = {
          sId: selectedUploadedDoc._id,
          issuedBy,
          issueDate,
        };

        if (isExpiryRequired) {
          bodyData.expiryDate = expiryDate;
        }

        const res = await fetch(
          `${baseUrl}${urls?.document?.updateDetails}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify(bodyData),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          notify(false, data.message || "Update failed");
          return;
        }

        notify(true, "Details updated successfully");
      }

      await fetchUploadedDocuments();
      setUploadDrawerDoc(null);
      setIsEditMode(false);
      setSelectedFile(null);

    } catch (err) {
      console.error(err);
      notify(false, "Server error");
    } finally {
      setIsUploading(false);
    }
  }

const handleDeleteDocument = async () => {
    if (!selectedUploadedDoc?._id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?",
    );
    if (!confirmDelete) return;

    try {
      setIsUploading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_DOCUMENT_DELETE_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            sId: selectedUploadedDoc._id,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        notify(false, data.message || "Delete failed");
        return;
      }

      notify(true, "Document deleted successfully");

      await fetchUploadedDocuments();

      setUploadDrawerDoc(null);
      setIsEditMode(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("Delete error:", err);
      notify(false, "Server error");
    } finally {
      setIsUploading(false);
    }
  }

const fetchDocumentTimeline = async (docId) => {
    try {
      setLoadingTimeline(true);
      setShowTimelineModal(true);
      setTimelineData([]);

      const endpoint = urls?.documentActivity?.timeline || "api/documentActivity/timeline";

      let res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ documentId: docId, id: docId }),
      });

      if (!res.ok) {
        // Fallback to GET
        res = await fetch(`${baseUrl}${endpoint}?documentId=${docId}&id=${docId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const list = Array.isArray(data.data)
            ? data.data
            : (Array.isArray(data.data.activities)
              ? data.data.activities
              : (Array.isArray(data.data.timeline)
                ? data.data.timeline
                : []));
          setTimelineData(list);
        }
      }
    } catch (err) {
      console.error("Error fetching document timeline:", err);
    } finally {
      setLoadingTimeline(false);
    }
  }