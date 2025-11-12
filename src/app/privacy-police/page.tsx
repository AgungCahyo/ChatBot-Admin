import DashboardLayout from "@/components/DashboardLayout";
import React from "react";

export default function PrivacyPolicy() {
  return (
    <DashboardLayout>

    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: November 2025</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            <strong>[Nama Aplikasi / Bisnis Kamu]</strong> menghargai privasi pengguna
            dan berkomitmen untuk melindungi data pribadi yang dikumpulkan melalui layanan kami,
            termasuk integrasi WhatsApp API dan sistem otomatisasi pesan.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Data yang Kami Kumpulkan</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Nomor telepon dan nama akun WhatsApp.</li>
            <li>Pesan yang dikirim atau diterima melalui sistem otomatisasi kami.</li>
            <li>Data teknis seperti alamat IP, waktu permintaan, dan event webhook.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. Tujuan Penggunaan Data</h2>
          <p>
            Data yang dikumpulkan digunakan untuk:
          </p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>Menyediakan dan mengoperasikan layanan otomatisasi pesan.</li>
            <li>Memastikan keamanan dan keandalan sistem.</li>
            <li>Memberikan dukungan teknis kepada pengguna.</li>
          </ul>
          <p className="mt-2">
            Kami <strong>tidak menjual atau membagikan data pribadi</strong> kepada pihak ketiga tanpa izin eksplisit dari pengguna.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Keamanan Data</h2>
          <p>
            Kami menggunakan langkah-langkah teknis dan organisasi yang wajar
            untuk melindungi data dari akses, perubahan, atau penghapusan yang tidak sah.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Hak Pengguna</h2>
          <p>
            Pengguna dapat meminta penghapusan atau pembaruan data pribadi mereka
            dengan menghubungi kami melalui kontak yang tersedia di bawah.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">6. Perubahan Kebijakan</h2>
          <p>
            Kami dapat memperbarui kebijakan ini dari waktu ke waktu.
            Setiap perubahan akan diumumkan melalui halaman ini dengan tanggal pembaruan terbaru.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Kontak</h2>
          <p>
            Jika ada pertanyaan tentang kebijakan privasi ini, silakan hubungi kami di:
          </p>
          <ul className="list-none mt-2">
            <li>📧 <a href="mailto:[email protected]" className="text-blue-600 underline">[email protected]</a></li>
            <li>🌐 <a href="https://[domain-kamu].com" className="text-blue-600 underline">https://[domain-kamu].com</a></li>
          </ul>
        </section>
      </div>
    </div>
    </DashboardLayout>
  );
}
