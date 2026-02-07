"use client";

import useSWR from "swr";
import { devicesApi } from "@/lib/supabase/api";
import type { Device, DeviceWithParts } from "@/lib/types/lab";

export function useDevices() {
  return useSWR("lab:devices", () => devicesApi.getAll(), {
    revalidateOnFocus: false,
  });
}

export function useDevice(id: string | null) {
  return useSWR(
    id ? `lab:device:${id}` : null,
    () => devicesApi.getById(id!),
    { revalidateOnFocus: false }
  );
}

export function useDeviceCount() {
  return useSWR("lab:devices:count", () => devicesApi.getCount(), {
    revalidateOnFocus: false,
  });
}

export function useDeviceMutations() {
  return {
    createDevice: devicesApi.create,
    updateDevice: devicesApi.update,
    deleteDevice: devicesApi.delete,
  };
}
