const handleUploadClick = () => {
    if (!selectedDocument) return alert("Select document first");
    fileInputRef.current.click();
  }

const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (isEditMode && selectedUploadedDoc?._id) {
      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("sId", selectedUploadedDoc._id);

        const res = await fetch(
          `${baseUrl}${urls?.document?.updateFile}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: formData,
          },
        );

        const data = await res.json();

        if (!res.ok) {
          notify(false, data.message || "File update failed");
          return;
        }

        notify(true, "File updated successfully");

        await fetchUploadedDocuments();
        setSelectedFile(null);
      } catch (err) {
        console.error(err);
        notify(false, "Server error");
      } finally {
        setIsUploading(false);
      }
    }
  }