import {
  ActionItem,
  MeetingDetail,
  MeetingListItem,
} from "./types";

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const API = rawApiUrl.replace(/\/+$/, "");

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();
      message =
        typeof body?.detail === "string"
          ? body.detail
          : message;
    } catch {
      // Keep the fallback error message when response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  meetings: (params = new URLSearchParams()) => {
    const query = params.toString();

    return request<MeetingListItem[]>(
      query ? `/meetings?${query}` : "/meetings",
    );
  },

  searchMeetings: (query: string) => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("search", query.trim());
    }

    params.set("sort", "recent");

    return request<MeetingListItem[]>(
      `/meetings?${params.toString()}`,
    );
  },

  meeting: (id: number) =>
    request<MeetingDetail>(`/meetings/${id}`),

  create: (data: unknown) =>
    request<MeetingDetail>("/meetings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  upload: (data: FormData) =>
    request<MeetingDetail>("/meetings/upload", {
      method: "POST",
      body: data,
    }),

  update: (id: number, data: unknown) =>
    request<MeetingDetail>(`/meetings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    request<void>(`/meetings/${id}`, {
      method: "DELETE",
    }),

  addAction: (meetingId: number, data: unknown) =>
    request<ActionItem>(
      `/meetings/${meetingId}/actions`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  updateAction: (
    meetingId: number,
    actionId: number,
    data: unknown,
  ) =>
    request<ActionItem>(
      `/meetings/${meetingId}/actions/${actionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    ),

  deleteAction: (
    meetingId: number,
    actionId: number,
  ) =>
    request<void>(
      `/meetings/${meetingId}/actions/${actionId}`,
      {
        method: "DELETE",
      },
    ),
};