import Page from '../page'

export default async function LibraryAdminPage(props: any) {
    const params = await props.params
    const searchParams = await props.searchParams
    return <Page params={Promise.resolve(params)} searchParams={Promise.resolve({ ...searchParams, category: 'LIBRARY' })} />
}
