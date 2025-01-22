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

  // Reset form when drawer closes
  useEffect(() => {
    if (!editGenericsDrawer) {
      form.resetFields();
    }
  }, [editGenericsDrawer, form]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      fetchSubCategories(categoryId);
    }
  }, [categoryId, fetchSubCategories]);

  // Set initial values when drawer opens
  useEffect(() => {
    if (currentGenerics && categories) {
      // First fetch subcategories for the current category
      if (currentGenerics.subCategory?.category?.id) {
        fetchSubCategories(currentGenerics.subCategory.category.id).then(() => {
          // After fetching subcategories, set all form values
          form.setFieldsValue({
            name: currentGenerics.name,
            description: currentGenerics.description,
            category_id: currentGenerics.subCategory.category.id,
            sub_category_id: currentGenerics.subCategory.id,
          });
        });
      }
    }
  }, [currentGenerics, categories, form, fetchSubCategories]);

  const handleUpdateGenerics = async (formData) => {
    try {
      const response = await updateGeneric({
        id: currentGenerics.id,
        ...formData,
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

  // Format options for the dropdowns
  const selectCategories =
    categories?.categories?.map((category) => ({
      label: category.name,
      value: category.id,
    })) ?? [];

  const selectSubCategories =
    subCategories?.subCategories?.map((subCategory) => ({
      label: subCategory.name,
      value: subCategory.id,
    })) ?? [];

  return (
    <Drawer
      title={<h3 className="border-b text-center text-xl">Edit Generics</h3>}
      open={editGenericsDrawer}
      onClose={() => dispatch(closeEditGenericsDrawer())}
      footer={null}
      destroyOnClose={true}
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
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                loading={categoriesLoading}
                size="large"
                allowClear
                showSearch
                options={selectCategories}
                notFoundContent={
                  categoriesLoading ? "Loading..." : "No Categories Available"
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
                size="large"
                loading={subCategoriesLoading}
                allowClear
                options={selectSubCategories}
                notFoundContent={
                  subCategoriesLoading
                    ? "Loading..."
                    : "No Sub-categories Available"
                }
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
