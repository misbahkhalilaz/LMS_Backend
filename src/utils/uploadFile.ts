import multer from "multer";
import path from "path";

export default class UploadFile {
  private storage: multer.StorageEngine;
  private fileFilter: any;
  public upload: multer.Multer;

  constructor(
    no_of_files: number = 1,
    extensions: Array<string> = [".xls", ".xlsx"],
    fileSize: number = 1024 * 1024,
    dest: string = "storage/"
  ) {
    this.storage = multer.diskStorage({
      //setup storage and file naming options.
      destination: (req, file, cb) => {
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        cb(
          null,
          file.fieldname +
            "-" +
            Date.now() +
            path.extname(file.originalname) +
            ".temp"
        );
      },
    });
    this.fileFilter = function (req: any, file: any, cb: any) {
      if (!extensions.includes(path.extname(file.originalname))) {
        return cb(
          new Error(
            `${path.extname(
              file.originalname
            )} not allowed, allowed types: ${extensions}`
          )
        );
      }
      cb(null, true);
    };
    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: { fileSize: fileSize, files: no_of_files },
    });
  }
}
