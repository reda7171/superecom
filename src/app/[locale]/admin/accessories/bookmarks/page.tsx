import Page from '../page'

export default async function BookmarksAdminPage(props: any) {
    // Inject category for the shared page component
    const params = await props.params
    const searchParams = await props.searchParams
    return <Page params={Promise.resolve(params)} searchParams={Promise.resolve({ ...searchParams, category: 'BOOKMARK' })} />
}
