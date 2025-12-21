import dicomParser from "dicom-parser";

export type DicomMetadata = {
  patientName?: string;
  patientId?: string;
  patientSex?: string;
  patientAge?: string;
};

export function readDicomMetadata(file: File): Promise<DicomMetadata> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const byteArray = new Uint8Array(reader.result as ArrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);

        resolve({
          patientName: dataSet.string("x00100010"), // PatientName
          patientId: dataSet.string("x00100020"),   // PatientID
          patientSex: dataSet.string("x00100040"),  // PatientSex
          patientAge: dataSet.string("x00101010"),  // PatientAge
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}
