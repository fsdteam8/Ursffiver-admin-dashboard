"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { interestsApi } from "@/lib/api";
import { Plus, SquarePen, Trash2 } from "lucide-react";

// Define TypeScript interfaces
interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Category[];
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<Category>({
    _id: "",
    name: "",
    createdAt: "",
    updatedAt: "",
    __v: 0,
  });
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const limit: number = 10; // Items per page

  // Fetch categories with pagination
  const fetchCategories = async (pageNum: number = 1) => {
    try {
      const response = await interestsApi.getCategories();
      const data: Category[] = (response.data as ApiResponse).data;
      // Client-side pagination (update if API supports pagination)
      const startIndex = (pageNum - 1) * limit;
      const paginatedData = data.slice(startIndex, startIndex + limit);
      setCategories(paginatedData);
      setTotalPages(Math.ceil(data.length / limit));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  // Handle modal open for create/edit
  const handleOpenModal = (
    category: Category = {
      _id: "",
      name: "",
      createdAt: "",
      updatedAt: "",
      __v: 0,
    }
  ) => {
    setCurrentCategory(category);
    setIsEdit(!!category._id);
    setModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentCategory({
      _id: "",
      name: "",
      createdAt: "",
      updatedAt: "",
      __v: 0,
    });
  };

  // Handle create/update category
  const handleSaveCategory = async () => {
    try {
      if (isEdit) {
        await interestsApi.updateCategory(
          currentCategory._id,
          currentCategory.name
        );
      } else {
        await interestsApi.createCategory(currentCategory.name);
      }
      fetchCategories(page);
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  // Handle delete modal open
  const handleOpenDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await interestsApi.deleteCategory(categoryToDelete._id); // Adjust if there's a specific deleteCategory endpoint
      fetchCategories(page);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCategory({ ...currentCategory, name: e.target.value });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-[#3F42EE] to-[#8A8CF5] bg-clip-text text-transparent">
            Categories Management
          </h1>
          <p className="text-[#353549] text-14 font-normal">
            Create, organize, and update categories to streamline content
            discovery and improve user engagement.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            onClick={() => handleOpenModal()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Category
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right pr-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category._id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>
                {new Date(category.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex items-center justify-end gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenModal(category)}
                    className="cursor-pointer"
                  >
                    <SquarePen />
                  </Button>
                  <Button
                    className="cursor-pointer"
                    variant="destructive"
                    onClick={() => handleOpenDeleteModal(category)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="self-center">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-[#3F42EE] to-[#8A8CF5] bg-clip-text text-transparent">
              {isEdit ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <Label htmlFor="name" className="text-right">
                Category Name
              </Label>
              <Input
                id="name"
                value={currentCategory.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the category "
            {categoryToDelete?.name}"?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="cursor-pointer"
            >
              No
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              className="cursor-pointer"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
