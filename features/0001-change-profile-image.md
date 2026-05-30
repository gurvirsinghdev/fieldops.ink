You need to add the ability to change the profile image. Once the user is logged into the application, they are presented with the their workspace dashboard. For more details on how the routing to the workspace dashboard works you can check next.config.ts and lib/utils.ts file.

We want to store uploaded images in the cloudinary dashboard, and there is no need to check the .env file and you can just use the standard names for the environment variables and finally at the end let the user know about the environment variables that they need to setup in the .env file with it's name and it's usage blurb.

You can head to prisma/schema.prisma to understand the database architecture and most importantly the User model has an optional image string property, once the user uploads the image you need to store the cloudinary public url in the database. 

User Flow:
  - The user is at the workspace dashboard and clicks settings.
  - In the settings page they are already at the profile app/[workspaceSlug]/settings/profile/page.tsx
  - Then they click the change image button that then open a beautiful dialog where they can choose a file from their system (not-drag-n-drop) and click the upload button. It then sends the image to the api server that acts as a proxy and just uploads the image to the cloudinary and updates the database. 
  - Once the update is done, the model closes and the zustand store is rehydrated and the new image should be displayed in the UserAvatar component automatically. 

Constraints:
  - User must upload a valid, and widely-accpeted image format. If the AvatarImage components supports rendering of GIFs then allow the user to upload a GIF too, otherwise only stick the valid and widely-compatible image formats. 
  - The provided file for the upload procedure should not exceed 2MB in size.
