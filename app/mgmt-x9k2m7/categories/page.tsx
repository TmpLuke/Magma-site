"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/admin/data-table";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  FolderOpen,
  Package,
  Image as ImageIcon,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithProductCount,
} from "@/app/actions/admin-categories";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  display_order: number;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  display_order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image: "",
    display_order: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCategories(
        categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(query) ||
            cat.slug.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, categories]);

  async function loadCategories() {
    try {
      setLoading(true);
      const result = await getCategoriesWithProductCount();
      if (result.success) {
        setCategories(result.data);
        setFilteredCategories(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error loading categories",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      display_order: categories.length,
    });
    setShowAddModal(true);
  }

  function openEditModal(category: Category) {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      display_order: category.display_order,
    });
    setShowEditModal(true);
  }

  function openDeleteModal(category: Category) {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  }

  async function handleAddCategory() {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and slug are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await createCategory(formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Category created successfully",
        });
        setShowAddModal(false);
        loadCategories();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditCategory() {
    if (!selectedCategory || !formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and slug are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await updateCategory(selectedCategory.id, formData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        setShowEditModal(false);
        loadCategories();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategory() {
    if (!selectedCategory) return;

    try {
      setSubmitting(true);
      const result = await deleteCategory(selectedCategory.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        setShowDeleteModal(false);
        loadCategories();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    });
  }

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] overflow-hidden relative flex-shrink-0 border border-[#262626]">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white/20" />
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (category: Category) => (
        <Link
          href={`/mgmt-x9k2m7/categories/${category.id}`}
          className="font-semibold text-white hover:text-[#dc2626] transition-colors"
        >
          {category.name}
        </Link>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (category: Category) => (
        <span className="px-2 py-1 bg-[#1a1a1a] rounded border border-[#262626] text-xs text-white/70">
          {category.slug}
        </span>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (category: Category) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-white/40" />
          <span className="text-white/80">{category.product_count || 0}</span>
        </div>
      ),
    },
    {
      key: "display_order",
      label: "Order",
      render: (category: Category) => (
        <span className="text-white/60">{category.display_order}</span>
      ),
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FolderOpen className="w-7 h-7 text-[#dc2626]" />
              Categories
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Manage product categories and organization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={loadCategories}
              variant="outline"
              size="sm"
              disabled={loading}
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={openAddModal}
              size="sm"
              className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#111111] border-[#262626] text-white placeholder:text-white/30"
          />
        </div>

        {/* Categories Table */}
        <DataTable
          columns={columns}
          data={filteredCategories}
          loading={loading}
          emptyMessage="No categories found"
          actions={(category) => (
            <div className="flex gap-1.5">
              <Link href={`/mgmt-x9k2m7/categories/${category.id}`}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                  title="View Products"
                >
                  <Package className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                onClick={() => openEditModal(category)}
                size="sm"
                variant="ghost"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                title="Edit Category"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => openDeleteModal(category)}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        />

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border border-[#262626] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#262626]">
                <h2 className="text-xl font-bold text-white">Add New Category</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label className="text-white mb-2">Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., CALL OF DUTY"
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="call-of-duty"
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                  <p className="text-xs text-white/40 mt-1">Auto-generated from name</p>
                </div>
                <div>
                  <Label className="text-white mb-2">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Category description..."
                    rows={3}
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Image URL</Label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-[#262626] flex gap-3 justify-end">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  disabled={submitting}
                  className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCategory}
                  disabled={submitting}
                  className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Add Category
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border border-[#262626] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#262626]">
                <h2 className="text-xl font-bold text-white">Edit Category</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label className="text-white mb-2">Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., CALL OF DUTY"
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="call-of-duty"
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Category description..."
                    rows={3}
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Image URL</Label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2">Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="bg-[#1a1a1a] border-[#262626] text-white"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-[#262626] flex gap-3 justify-end">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  disabled={submitting}
                  className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleEditCategory}
                  disabled={submitting}
                  className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111111] border border-[#262626] rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-[#262626]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Delete Category</h2>
                    <p className="text-sm text-white/50">This action cannot be undone</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-white/70">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-white">{selectedCategory?.name}</span>?
                </p>
                <p className="text-sm text-red-400 mt-3">
                  Note: You cannot delete a category that has products. Reassign or delete products first.
                </p>
              </div>
              <div className="p-6 border-t border-[#262626] flex gap-3 justify-end">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="outline"
                  disabled={submitting}
                  className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteCategory}
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete Category
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
