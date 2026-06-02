export function extractApiData(response) {
  return response?.data?.data ?? response?.data ?? response
}

export function getItems(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

export function statusTone(value) {
  if (['ACTIVE', 'SUCCESS', 'SENT', 'READ', 'COMPLETED', 'printed'].includes(value)) {
    return 'success'
  }

  if (['RUNNING', 'PENDING', 'PENDING_APPROVAL', 'queued', 'printing'].includes(value)) {
    return 'warning'
  }

  if (['FAILED', 'REJECTED', 'REVERSED', 'failed', 'cancelled'].includes(value)) {
    return 'danger'
  }

  return 'muted'
}
