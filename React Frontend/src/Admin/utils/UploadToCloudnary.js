export const uploadToCloudinary = async (pics) => {
  if (pics) {
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "Rmeals_images_frontend");
    data.append("cloud_name", "dkde7wrfc");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dkde7wrfc/image/upload`,
      {
        method: "post",
        body: data,
      }
    );

    const fileData = await res.json();
    console.log("url : ", fileData);
    return fileData.url;
  } else {
    console.log("error");
  }
};
