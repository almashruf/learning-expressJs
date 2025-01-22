import React, { useEffect } from "react";
import { Button, Form, Input, Drawer, Select, App } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  useUpdateGenericMutation,
  useFetchCategoriesQuery,
  useLazyFetchSelectSubCategoriesQuery,
} from "@/app/features/store/generics/genericsApiSlice";
import {
  closeEditGenericsDrawer,
  selectGenericsState,
} from "@/app/features/store/generics/genericsSlice";
import { EditOutlined } from "@ant-design/icons";

export default function EditGenericsDrawer() {
  const [form] = Form.useForm();
  const { editGenericsDrawer, currentGenerics } =
    useSelector(selectGenericsState);

  const dispatch = useDispatch();
  const { notification } = App.useApp();

  const [updateGeneric, { isLoading }] = useUpdateGenericMutation();

  const { data: categories, isLoading: categoriesLoading } =
    useFetchCategoriesQuery(null, {
      skip: !editGenericsDrawer,
      refetchOnReconnect: true,
    });

  const [
    fetchSubCategories,
    { data: subCategories, isFetching: subCategoriesLoading },
  ] = useLazyFetchSelectSubCategoriesQuery({
    refetchOnReconnect: true,
  });

  const categoryId = Form.useWatch("category_id", form);

  // Set initial form values
  useEffect(() => {
    if (currentGenerics && editGenericsDrawer) {
      const categoryId = currentGenerics.subCategory?.category?.id;
      const subCategoryId = currentGenerics.subCategory?.id;

      // Find category and subcategory names
      const categoryName = currentGenerics.subCategory?.category?.name;
      const subCategoryName = currentGenerics.subCategory?.name;

      // Fetch sub-categories if category exists
      if (categoryId) {
        fetchSubCategories(categoryId);
      }

      // Set form fields with both value and label for dropdowns
      form.setFieldsValue({
        name: currentGenerics.name,
        description: currentGenerics.description,
        category_id: categoryId
          ? { value: categoryId, label: categoryName }
          : undefined,
        sub_category_id: subCategoryId
          ? { value: subCategoryId, label: subCategoryName }
          : undefined,
      });
    }
  }, [currentGenerics, editGenericsDrawer, form, fetchSubCategories]);

  // Fetch sub-categories when category changes
  useEffect(() => {
    if (categoryId?.value) {
      fetchSubCategories(categoryId.value);
    }
  }, [categoryId, fetchSubCategories]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!editGenericsDrawer) {
      form.resetFields();
    }
  }, [editGenericsDrawer, form]);

  const handleUpdateGenerics = async (formData) => {
    try {
      // Extract actual values from the selected options
      const processedData = {
        ...formData,
        category_id: formData.category_id?.value,
        sub_category_id: formData.sub_category_id?.value,
      };

      const response = await updateGeneric({
        id: currentGenerics.id,
        ...processedData,
      }).unwrap();

      notification.success({
        message: "Generic Updated",
        description: response.message,
        placement: "bottomLeft",
      });
      dispatch(closeEditGenericsDrawer());
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "Update Failed",
        description:
          error?.data?.message || "There was an issue updating the generic.",
      });
    }
  };

  // Prepare category options with full option objects
  const categoryOptions = React.useMemo(() => {
    if (!categories?.categories) return [];
    return categories.categories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categories]);

  // Prepare sub-category options with full option objects
  const subCategoryOptions = React.useMemo(() => {
    if (!subCategories?.subCategories) return [];
    return subCategories.subCategories.map((subCategory) => ({
      value: subCategory.id,
      label: subCategory.name,
    }));
  }, [subCategories]);

  return (
    <Drawer
      title={<h3 className="border-b text-center text-xl">Edit Generics</h3>}
      open={editGenericsDrawer}
      onClose={() => dispatch(closeEditGenericsDrawer())}
      footer={null}
      destroyOnClose={true}
      width={500}
    >
      <div className="mt-5 flex justify-center">
        <div className="w-full max-w-[500px]">
          <Form
            layout="vertical"
            form={form}
            onFinish={handleUpdateGenerics}
            preserve={false}
          >
            {/* Category Dropdown */}
            <Form.Item
              name="category_id"
              label="Category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select
                placeholder="Select a category"
                labelInValue
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                loading={categoriesLoading}
                size="large"
                allowClear
                showSearch
                options={categoryOptions}
                notFoundContent={
                  categoriesLoading ? "Loading..." : "No Categories Available"
                }
                onSelect={() =>
                  form.setFieldValue("sub_category_id", undefined)
                }
              />
            </Form.Item>

            {/* Sub-category Dropdown */}
            <Form.Item
              name="sub_category_id"
              label="Sub-category"
              rules={[
                { required: true, message: "Please select a sub-category" },
              ]}
            >
              <Select
                placeholder="Select a sub-category"
                labelInValue
                size="large"
                loading={subCategoriesLoading}
                allowClear
                options={subCategoryOptions}
                notFoundContent={
                  subCategoriesLoading
                    ? "Loading..."
                    : "No Sub-categories Available"
                }
                disabled={!categoryId}
              />
            </Form.Item>

            {/* Name Field */}
            <Form.Item
              name="name"
              label="Generic Name"
              rules={[
                { required: true, message: "Please enter a generic name" },
              ]}
            >
              <Input
                placeholder="Enter generic name"
                size="large"
                maxLength={120}
              />
            </Form.Item>

            {/* Description Field */}
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea
                placeholder="Enter description"
                size="large"
                rows={4}
                maxLength={500}
              />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                icon={<EditOutlined />}
                loading={isLoading}
              >
                UPDATE GENERIC
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Drawer>
  );
}
