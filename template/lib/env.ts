"use server"

export async function getRootUserEmail() {
    return process.env["ROOT_USER_EMAIL"] ;
}