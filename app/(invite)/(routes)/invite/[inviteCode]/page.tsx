import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

interface InviteCodePageProps {
  params: {
    inviteCode: string;
  };
}

const InviteCodePage = async ({
  params
}: InviteCodePageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  if (!params.inviteCode) {
    return redirect("/");
  }

  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode
    }
  });

  if (!existingServer) {
    // Server record not found, handle the error or redirect to an appropriate page
    return redirect("/error"); // Redirect to an error page
  }

  // Server record found, proceed with updating the server
  const updatedServer = await db.server.update({
    where: {
      id: existingServer.id // Use the ID of the existing server record
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id
          }
        ]
      }
    }
  });

  if (updatedServer) {
    return redirect(`/servers/${updatedServer.id}`);
  }

  // Handle other cases or return null
  return null;
}

export default InviteCodePage;
