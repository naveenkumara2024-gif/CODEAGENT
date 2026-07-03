
interface Props{
    params: Promise<{ projectId: string }>
}

const Page = async ({ params }: Props) => {
    const { projectId } = await params;
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            project page: {projectId}
        </div>
    )
}

export default Page