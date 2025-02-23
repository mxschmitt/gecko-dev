/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef ExternalTexture_H_
#define ExternalTexture_H_

#include "mozilla/gfx/Point.h"
#include "mozilla/layers/LayersSurfaces.h"
#include "mozilla/webgpu/ffi/wgpu.h"

namespace mozilla {

namespace ipc {
class Shmem;
}

namespace webgpu {

// A texture that can be used by the WebGPU implementation but is created and
// owned by Gecko
class ExternalTexture {
 public:
  static UniquePtr<ExternalTexture> Create(
      const uint32_t aWidth, const uint32_t aHeight,
      const struct ffi::WGPUTextureFormat aFormat);

  ExternalTexture(const uint32_t aWidth, const uint32_t aHeight,
                  const struct ffi::WGPUTextureFormat aFormat);
  virtual ~ExternalTexture();

  virtual void* GetExternalTextureHandle() { return nullptr; }

  virtual Maybe<layers::SurfaceDescriptor> ToSurfaceDescriptor() = 0;

  virtual void GetSnapshot(const ipc::Shmem& aDestShmem,
                           const gfx::IntSize& aSize) {}

  gfx::IntSize GetSize() { return gfx::IntSize(mWidth, mHeight); }

  void SetTextureRaw(ffi::WGPUTextureRaw* aTextureRaw);
  ffi::WGPUTextureRaw* GetTextureRaw() { return mTextureRaw; }

  const uint32_t mWidth;
  const uint32_t mHeight;
  const struct ffi::WGPUTextureFormat mFormat;

 protected:
  // Holds the raw object that could be used for creating wgpu Texture.
  ffi::WGPUTextureRaw* mTextureRaw = nullptr;
};

}  // namespace webgpu
}  // namespace mozilla

#endif  // GPU_ExternalTexture_H_
