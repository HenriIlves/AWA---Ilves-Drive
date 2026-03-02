import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataGrid, GridColDef, GridActionsCellItem, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid'
import { CircularProgress, Alert, Typography, Box, useMediaQuery, useTheme } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

interface Document {
    _id: string
    title: string
    createdAt?: string
    lastEditedAt?: string
}

const DocumentList = () => {
    const navigate = useNavigate()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const token = localStorage.getItem('token') || ''
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'lastEditedAt', sort: 'desc' }])

    const fetchDocuments = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/documents', {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            })
            if (!response.ok) {
                throw new Error('Failed to fetch documents')
            }
            const data = await response.json()
            setDocuments(data.documents)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    const handleRowClick = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/document/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(
                    errorData.error || 'Failed to open document'
                )
            }

            const data = await response.json()
            // Navigate to the document editor with the document data
            navigate(`/document/${id}`, { state: { document: data.document } })
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to open document')
        }
    }

    const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation() // Prevent triggering row click
        setDeleting(id)

        try {
            const response = await fetch(`http://localhost:3000/api/document/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete document')
            }

            // Remove document from list
            setDocuments((prev) => prev.filter((doc) => doc._id !== id))
        } catch (err) {
                alert(err instanceof Error ? err.message : 'Failed to delete document')
        } finally {
            setDeleting(null)
        }
    }

    const columns: GridColDef[] = [
        {
            field: 'title',
            headerName: 'Name',
            flex: 1,
            minWidth: 150,
            sortable: true,
        },
        {
            field: 'createdAt',
            headerName: 'Created',
            flex: 1,
            minWidth: 100,
            sortable: true,
            renderCell: (params) =>
                params.value
                ? new Date(params.value).toLocaleDateString()
                : '—',
        },
        {
            field: 'lastEditedAt',
            headerName: 'Last Edited',
            flex: 1,
            minWidth: 100,
            sortable: true,
            renderCell: (params) =>
                params.value
                ? new Date(params.value).toLocaleDateString()
                : '—',
        },
        {
            field: 'actions',
            headerName: '',
            width: 50,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams) => (
                <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={(e) => handleDeleteClick(e as React.MouseEvent, params.row._id)}
                disabled={deleting === params.row._id}
                />
            ),
        },
    ]

    if (loading) {
        return <CircularProgress />
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    if (documents.length === 0) {
        return (
            <Typography color="text.secondary">
                You don't have any documents yet.
            </Typography>
        )
    }

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                rows={documents}
                columns={columns}
                getRowId={(row) => row._id}
                onRowClick={(params) => handleRowClick(params.row._id)}
                sortModel={sortModel}
                onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
                columnVisibilityModel={{
                    lastEditedAt: !isMobile,
                }}
                pageSizeOptions={[15]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 15, page: 0 },
                    },
                }}
                slotProps={{
                    row: {
                        onClick: () => {},
                    },
                }}
                sx={{
                    cursor: 'pointer',
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
            />
        </Box>
    )
}

export default DocumentList