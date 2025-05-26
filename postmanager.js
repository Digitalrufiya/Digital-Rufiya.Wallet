async function uploadImage(file, path) {
  try {
    console.log(`Uploading image to path: drfsocial/${userId}/${path}`);
    const imageRef = sRef(storage, `drfsocial/${userId}/${path}`);
    const snapshot = await uploadBytes(imageRef, file);
    console.log("Upload snapshot:", snapshot);
    const url = await getDownloadURL(imageRef);
    console.log("Download URL:", url);
    return url;
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Image upload failed: " + error.message);
    return null;
  }
}

window.saveProfile = async function () {
  if (!userId) {
    alert("User ID not set!");
    return;
  }

  const name = document.getElementById("name").value;
  let profilePhoto = document.getElementById("profilePicPreview").src;
  let coverPhoto = document.getElementById("coverPicPreview").src;

  const profileFile = document.getElementById("profilePic").files[0];
  const coverFile = document.getElementById("coverPic").files[0];

  console.log("Starting profile save...");
  console.log("User ID:", userId);
  console.log("Name:", name);

  if (profileFile) {
    console.log("Profile file found, uploading...");
    const url = await uploadImage(profileFile, "profile.jpg");
    if (url) profilePhoto = url;
  } else {
    console.log("No profile file selected.");
  }

  if (coverFile) {
    console.log("Cover file found, uploading...");
    const url = await uploadImage(coverFile, "cover.jpg");
    if (url) coverPhoto = url;
  } else {
    console.log("No cover file selected.");
  }

  try {
    await set(ref(db, 'users/' + userId), {
      name,
      profilePhoto,
      coverPhoto
    });
    console.log("Profile saved in database.");
    alert("Profile saved!");
  } catch (error) {
    console.error("Saving profile failed:", error);
    alert("Failed to save profile data: " + error.message);
  }
};
