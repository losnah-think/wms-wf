import { redirect } from 'next/navigation'

export default function RootPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/warehouse-info`)
}
