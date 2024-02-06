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

    try {
        const existingServer = await db.server.findFirst({
            where: {
                inviteCode: params.inviteCode,
                members: {
                    some: {
                        profileId: profile.id
                    },
                },
            },
        });

        if (existingServer) {
            throw new Error(`NEXT_REDIRECT;replace;/servers/${existingServer.id};307;`);
        }

        const server = await db.server.update({
            where: {
                inviteCode: params.inviteCode,
            },
            data: {
                members: {
                    create: [
                        {
                            profileId: profile.id,
                        },
                    ],
                },
            },
        });

        if (server) {
            return redirect(`/servers/${server.id}`);
        }
    } catch (error) {
        console.error("Error processing invite code:", error);
    }
    return null;
};
 
export default InviteCodePage;