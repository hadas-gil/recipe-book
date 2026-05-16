import Header from '../../components/Header';
import AddRecipeForm from '../../components/AddRecipeForm';

export const metadata = { title: 'הוספת מתכון' };

export default function AddPage() {
  return (
    <>
      <Header />
      <main>
        <AddRecipeForm />
      </main>
    </>
  );
}
