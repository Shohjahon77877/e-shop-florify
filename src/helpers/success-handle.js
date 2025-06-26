export const successHandle = (res, resdata, code = 200) => {
    return res.status(code).json({
        statusCode: code,
        message: 'Success',
        data: resdata,
    })
}