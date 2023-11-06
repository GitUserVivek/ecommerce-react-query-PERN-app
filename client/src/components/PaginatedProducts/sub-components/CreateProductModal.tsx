import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../../../api/products';
import CreateUpdateProductModal from '../utils/CreateUpdateProductModal';
import { ProductWithNoProductId } from '../../../types/products';

type ThisProps = {
  showModal: boolean;
  updatePage: (newPage: number) => void;
  onClose: () => void;
};

const CreateProductModal = ({ onClose, showModal, updatePage }: ThisProps) => {
  const queryClient = useQueryClient();
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      updatePage(1);
      queryClient.removeQueries({
        queryKey: ['products'],
        type: 'all',
      });
      onClose();
    },
  });

  const onFormSubmittion = async (product: ProductWithNoProductId) => {
    const { title, description, price, image } = product;
    try {
      // console.log('validatedFormState: ', validatedFormState);
      await createProductMutation.mutateAsync({
        title,
        description,
        price,
        image,
      });
      toast.success('Product created successfully 😄');
    } catch (error) {
      toast.error('Unable to create  product 😮');
    }
  };

  const onCloseModal = () => {
    onClose();
  };

  return (
    <CreateUpdateProductModal
      onFormSubmittion={onFormSubmittion}
      allInputsDisabled={createProductMutation.isPending}
      showModal={showModal}
      onClose={onCloseModal}
    />
  );
};

export default CreateProductModal;
